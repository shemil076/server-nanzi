import { Test, TestingModule } from '@nestjs/testing';
import { TenantInvitationService } from './tenant-invitation.service';

describe('TenantInvitationService', () => {
  let service: TenantInvitationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantInvitationService],
    }).compile();

    service = module.get<TenantInvitationService>(TenantInvitationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
