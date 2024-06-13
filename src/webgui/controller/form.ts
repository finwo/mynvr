import { Controller, Post, Get, Req, Res, Middleware } from '@finwo/router';
import { FastifyRequest, FastifyReply                } from 'fastify';
import { readFileSync                                } from 'fs';
import { resolve                                     } from 'path';
import { Template                                    } from '@webgui/template';
import   mime                                          from 'mime-types';
import   authenticated                                 from '@identity/middleware/authenticated';
import   requireAuthentication                         from '@identity/middleware/require-authentication';
import { CameraRepository                            } from '@nvr/repository/camera';
import { isCamera, Camera                            } from '@nvr/model/camera';
import { isUser, User                                } from '@identity/model/user';
import { isCredential, Credential                    } from '@identity/model/credential';
import { AuthenticatedRequest                        } from '@identity/model/authenticated-request';
import { RecordingRangeQuery                         } from '@nvr/query/recording-range';
import { UserRepository                              } from '@identity/repository/user';
import { CredentialRepository                        } from '@identity/repository/credential';
import { pbkdf2Sync } from 'pbkdf2';

import { Ajv        } from 'ajv';
import { FromSchema } from 'json-schema-to-ts';
const ajv = new Ajv();

export const userFormSchema = {
  title     : 'User form',
  type      : 'object',
  properties: {
    id: {
      type: 'string',
    },
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
    passwordRepeat: {
      type: 'string',
    },
  },
  required: [
    'username',
  ],
} as const;

export type UserForm = FromSchema<typeof userFormSchema>;
export const isUserForm: (subject:any)=>subject is UserForm = ajv.compile(userFormSchema);

const assetDir = resolve(__dirname, '../../../assets');

@Controller("/ui/form")
export class FormController {
  constructor(
    private template: Template,
    private userRepository: UserRepository,
    private cameraRepository: CameraRepository,
    private credentialRepository: CredentialRepository,
  ) {}

  @Get("/camera-details.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveCameraDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    res.header('Content-Type', 'text/html');
    const data = {
      site: {title:'MyNVR'},
      req: {
        query: req.query as Record<string, string>,
      },
      camera: undefined as (Camera | undefined)
    };
    if (data.req.query.camera) {
      data.camera = await this.cameraRepository.get(data.req.query.camera);
    }
    return res.send(this.template.render('form/camera-details.html', data));
  }

  @Get("/user-details.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async serveUserDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    res.header('Content-Type', 'text/html');
    const data = {
      site: {title:'MyNVR'},
      req: {
        query: req.query as Record<string, string>,
      },
      user: undefined as (User | undefined)
    };
    if (data.req.query.user) {
      data.user = await this.userRepository.getById(data.req.query.user);
    }
    return res.send(this.template.render('form/user-details.html', data));
  }

  @Post("/camera-details.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async handleCameraDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    const isHtmx = (req.headers['hx-request'] && req.headers['hx-request'] == 'true');

    if (!isCamera(req.body)) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/camera-details.html', {
        error: 'Invalid data'
      }));
    }

    if (!(await this.cameraRepository.save(req.body))) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/camera-details.html', {
        error: 'Internal server error'
      }));
    }

    // Prevent duplicate camera upon name update
    const query = req.query as Record<string, string>;
    if (query.camera && (req.body.name !== query.camera)) {
      await this.cameraRepository.delete(query.camera);
    }

    if (isHtmx) {
      res.statusCode = 204;
      res.header('HX-Redirect', '/ui/cameras/' + req.body.name);
      return res.send();
    } else {
      res.statusCode = 302;
      res.header('Location', '/ui/cameras/' + req.body.name);
      return res.send();
    }
  }

  @Post("/user-details.html")
  @Middleware(authenticated)
  @Middleware(requireAuthentication())
  async handleUserDetails(
    @Req() req: AuthenticatedRequest,
    @Res() res: FastifyReply
  ) {
    if (!req.auth) throw new Error();
    const isHtmx = (req.headers['hx-request'] && req.headers['hx-request'] == 'true');

    // We're not limiting permissions here, just that you're logged in

    if (!isUserForm(req.body)) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/user-details.html', {
        error: 'Invalid data',
      }));
    }

    // Update username
    const user = {
      id      : req.body.id,
      username: req.body.username,
    } as User;
    if (!(await this.userRepository.save(user))) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/user-details.html', {
        error: 'Internal server error',
      }));
    }

    // Update password
    if (req.body.password && (req.body.password !== req.body.passwordRepeat)) {
      res.header('Content-Type', 'text/html');
      return res.send(this.template.render('form/user-details.html', {
        error: 'Passwords do not match',
      }));
    }
    if (req.body.password) {
      const credential: Credential = {
        userId     : user.id,
        type       : 'password',
        descriptor : 'pbkdf2:10000:sha512:' + pbkdf2Sync(req.body.password, req.body.username, 10000, 32, 'sha512').toString('hex'),
      };
      await this.credentialRepository.save(credential);
      if (!credential.id) return res.send(this.template.render('form/user-details.html', {
        error: 'Unable to update credentials',
      }));
    }

    if (isHtmx) {
      res.statusCode = 204;
      res.header('HX-Redirect', '/ui/users/' + user.id);
      return res.send();
    } else {
      res.statusCode = 302;
      res.header('Location', '/ui/users/' + user.id);
      return res.send();
    }
  }

}
