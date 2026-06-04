import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { CategorySupabaseRepository } from "@/server/repositories/categoryRepository";
import {
  CompetitionSupabaseRepository,
  CompetitionTeamSupabaseRepository,
} from "@/server/repositories/competitionRepository";
import { CollatorSupabaseRepository } from "@/server/repositories/collatorRepository";
import { CompetitionTypeSupabaseRepository } from "@/server/repositories/competitionTypeRepository";
import { EventSeasonSupabaseRepository } from "@/server/repositories/eventSeasonRepository";
import { PositionSupabaseRepository } from "@/server/repositories/positionRepository";
import { NationalitySupabaseRepository } from "@/server/repositories/nationalityRepository";
import { AffiliationSupabaseRepository } from "@/server/repositories/affiliationRepository";
import { FootPreferenceSupabaseRepository } from "@/server/repositories/footPreferenceRepository";
import { BioDataSupabaseRepository } from "@/server/repositories/bioDataRepository";
import { QaLogSupabaseRepository } from "@/server/repositories/qaLogRepository";
import { LegacyTableSupabaseRepository } from "@/server/repositories/legacyTableRepository";
import { VideoVerificationSupabaseRepository } from "@/server/repositories/videoVerificationRepository";
import { OpsTableSupabaseRepository } from "@/server/repositories/opsTableRepository";
import { ApiKeySupabaseRepository } from "@/server/repositories/apiKeyRepository";
import { GroupSupabaseRepository } from "@/server/repositories/groupRepository";
import { LegacyPlayerSupabaseRepository } from "@/server/repositories/legacyPlayerRepository";
import { MatchSupabaseRepository } from "@/server/repositories/matchRepository";
import { NewsSupabaseRepository } from "@/server/repositories/newsRepository";
import { PlayerSupabaseRepository } from "@/server/repositories/playerRepository";
import { PointsSupabaseRepository } from "@/server/repositories/pointsRepository";
import { StageSupabaseRepository } from "@/server/repositories/stageRepository";
import { StructureSupabaseRepository } from "@/server/repositories/structureRepository";
import { StorageSupabaseRepository } from "@/server/repositories/storageRepository";
import { TeamSupabaseRepository } from "@/server/repositories/teamRepository";
import { CompetitionImportSupabaseRepository } from "@/server/repositories/competitionImportRepository";
import { CategoryService } from "@/server/services/categoryService";
import { CollatorService } from "@/server/services/collatorService";
import { CompetitionService } from "@/server/services/competitionService";
import { CompetitionTypeService } from "@/server/services/competitionTypeService";
import { EventSeasonService } from "@/server/services/eventSeasonService";
import { PositionService } from "@/server/services/positionService";
import { NationalityService } from "@/server/services/nationalityService";
import { AffiliationService } from "@/server/services/affiliationService";
import { FootPreferenceService } from "@/server/services/footPreferenceService";
import { QaLogService } from "@/server/services/qaLogService";
import { BioDataService } from "@/server/services/bioDataService";
import { LegacyTableService } from "@/server/services/legacyTableService";
import { VideoVerificationService } from "@/server/services/videoVerificationService";
import { OpsTableService } from "@/server/services/opsTableService";
import { ApiKeyService } from "@/server/services/apiKeyService";
import { GroupService } from "@/server/services/groupService";
import { LegacyPlayerService } from "@/server/services/legacyPlayerService";
import { MatchService } from "@/server/services/matchService";
import { NewsService } from "@/server/services/newsService";
import { PlayerService } from "@/server/services/playerService";
import { StageService } from "@/server/services/stageService";
import { StorageService } from "@/server/services/storageService";
import { TeamService } from "@/server/services/teamService";
import { PointsService } from "@/server/services/pointsService";

/**
 * Composition root: wire Supabase repositories to application services.
 */
export function getAdminServices() {
  const db = createSupabaseAdminClient();

  const teamRepo = new TeamSupabaseRepository(db);
  const playerRepo = new PlayerSupabaseRepository(db);
  const competitionRepo = new CompetitionSupabaseRepository(db);
  const competitionTeamRepo = new CompetitionTeamSupabaseRepository(db);
  const categoryRepo = new CategorySupabaseRepository(db);
  const stageRepo = new StageSupabaseRepository(db);
  const structureRepo = new StructureSupabaseRepository(db);
  const storageRepo = new StorageSupabaseRepository(db);
  const matchRepo = new MatchSupabaseRepository(db);
  const groupRepo = new GroupSupabaseRepository(db);
  const competitionTypeRepo = new CompetitionTypeSupabaseRepository(db);
  const collatorRepo = new CollatorSupabaseRepository(db);
  const pointsRepo = new PointsSupabaseRepository(db);
  const newsRepo = new NewsSupabaseRepository(db);
  const legacyPlayerRepo = new LegacyPlayerSupabaseRepository(db);
  const eventSeasonRepo = new EventSeasonSupabaseRepository(db);
  const positionRepo = new PositionSupabaseRepository(db);
  const nationalityRepo = new NationalitySupabaseRepository(db);
  const affiliationRepo = new AffiliationSupabaseRepository(db);
  const footPreferenceRepo = new FootPreferenceSupabaseRepository(db);
  const qaLogRepo = new QaLogSupabaseRepository(db);
  const bioDataRepo = new BioDataSupabaseRepository(db);
  const legacyTableRepo = new LegacyTableSupabaseRepository(db);
  const videoVerificationRepo = new VideoVerificationSupabaseRepository(db);
  const opsTableRepo = new OpsTableSupabaseRepository(db);
  const apiKeyRepo = new ApiKeySupabaseRepository(db);
  const competitionImportRepo = new CompetitionImportSupabaseRepository(db);

  const teamService = new TeamService(teamRepo, storageRepo);
  const playerService = new PlayerService(playerRepo, storageRepo);
  const matchService = new MatchService(matchRepo);
  const groupService = new GroupService(groupRepo, matchRepo, pointsRepo);
  const legacyPlayerService = new LegacyPlayerService(legacyPlayerRepo);
  const eventSeasonService = new EventSeasonService(eventSeasonRepo);
  const positionService = new PositionService(positionRepo);
  const nationalityService = new NationalityService(nationalityRepo);
  const affiliationService = new AffiliationService(affiliationRepo);
  const footPreferenceService = new FootPreferenceService(footPreferenceRepo);
  const qaLogService = new QaLogService(qaLogRepo);
  const bioDataService = new BioDataService(bioDataRepo, qaLogService);
  const legacyTableService = new LegacyTableService(legacyTableRepo, qaLogService);
  const videoVerificationService = new VideoVerificationService(videoVerificationRepo);
  const opsTableService = new OpsTableService(opsTableRepo, qaLogService);
  const apiKeyService = new ApiKeyService(apiKeyRepo);

  return {
    teamService,
    playerService,
    competitionService: new CompetitionService(
      competitionRepo,
      competitionTeamRepo,
      teamService,
      storageRepo,
      structureRepo,
      playerRepo,
      competitionImportRepo
    ),
    categoryService: new CategoryService(categoryRepo),
    stageService: new StageService(stageRepo),
    storageService: new StorageService(storageRepo),
    matchService,
    groupService,
    competitionTypeService: new CompetitionTypeService(competitionTypeRepo),
    collatorService: new CollatorService(collatorRepo),
    pointsService: new PointsService(pointsRepo),
    newsService: new NewsService(newsRepo),
    legacyPlayerService,
    eventSeasonService,
    positionService,
    nationalityService,
    affiliationService,
    footPreferenceService,
    qaLogService,
    bioDataService,
    legacyTableService,
    videoVerificationService,
    opsTableService,
    apiKeyService,
  };
}
