import { Test, TestingModule } from '@nestjs/testing';
import { TenantInvitationController } from './tenant-invitation.controller';

describe('TenantInvitationController', () => {
  let controller: TenantInvitationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantInvitationController],
    }).compile();

    controller = module.get<TenantInvitationController>(TenantInvitationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
