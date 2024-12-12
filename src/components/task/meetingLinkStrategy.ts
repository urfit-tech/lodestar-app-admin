import axios from "axios"
import dayjs from "dayjs"
import moment from "moment"
import taskMessages from './translation'


type MeetingParams = {
  memberId: string
  startedAt: Date
  endedAt: Date
  nbfAt: Date | null
  expAt: Date | null
  hostMemberId: string
  memberTaskId: string
  meetType: string
  hostMemberName: string
}

export enum MeetingError {
  NOT_IN_MEETING_PERIOD = 'NOT_IN_MEETING_PERIOD',
  CREATE_MEET_ERROR = 'CREATE_MEET_ERROR',
  MEET_SERVICE_MODULE_NOT_ENABLED = 'MEET_SERVICE_MODULE_NOT_ENABLED',
}

export enum MeetingServiceType {
  ZOOM = 'zoom',
  JITSI = 'jitsi',
  GOOGLE_MEET = 'google-meet',
}


abstract class MeetingLinkStrategy {
  protected readonly params: MeetingParams
  protected readonly appId: string
  protected readonly authToken: string | null
  protected readonly service: MeetingServiceType = MeetingServiceType.JITSI
  protected readonly isMeetingServiceModuleDisabled: boolean = true

  constructor(params: MeetingParams, appId: string, authToken: string | null, meetingServiceEnabledModules: boolean) {
    this.params = {
      memberId: params.memberId,
      startedAt: params.startedAt,
      endedAt: params.endedAt,
      nbfAt: params.nbfAt,
      expAt: params.expAt,
      hostMemberId: params.hostMemberId,
      memberTaskId: params.memberTaskId,
      meetType: params.meetType,
      hostMemberName: params.hostMemberName,
    }
    this.appId = appId
    this.authToken = authToken
    this.isMeetingServiceModuleDisabled = !meetingServiceEnabledModules
  }

  public async getMeetingUrl(): Promise<{
    meetingUrl: string | undefined
    error: MeetingError | undefined
  }> {
    if (this.needToCheckMeetingPeriod() && this.isOutsideMeetingPeriod(this.params.nbfAt, this.params.expAt)) {
      return {
        meetingUrl: undefined,
        error: MeetingError.NOT_IN_MEETING_PERIOD,
      }
    }

    if (this.isMeetingServiceModuleActivationRequired() && this.isMeetingServiceModuleDisabled) {
      return {
        meetingUrl: undefined,
        error: MeetingError.MEET_SERVICE_MODULE_NOT_ENABLED,
      };
    }
    

    const meetingUrl = await this.createMeet()

    if (!meetingUrl) {
      return {
        meetingUrl: undefined,
        error: MeetingError.CREATE_MEET_ERROR,
      }
    }

    return {
      meetingUrl,
      error: undefined,
    }
  }

  protected isOutsideMeetingPeriod(nbfAt: Date | null, expAt: Date | null): boolean { 
    return !moment(new Date()).isBetween(nbfAt, expAt, null, '[)');
  }
  protected abstract needToCheckMeetingPeriod(): boolean

  protected async createMeet(): Promise<string | undefined> {
    if(!this.authToken) {
      return undefined
    } 

    try {
      const { data: createMeetData } = await axios.post(
        `${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/meets`,
        {
          memberId: this.params.memberId,
          startedAt: this.params.startedAt,
          endedAt: this.params.endedAt,
          autoRecording: true,
          nbfAt: dayjs(this.params.startedAt).subtract(10, 'minutes').toDate(),
          expAt: this.params.endedAt,
          service: this.service,
          target: this.params.memberTaskId,
          hostMemberId: this.params.hostMemberId,
          type: this.service,
        },
        { headers: { authorization: `Bearer ${this.authToken}` } },
      ) 
      return createMeetData.data?.options?.startUrl
    } catch (error) {
      return undefined
    }
  }

  protected abstract isMeetingServiceModuleActivationRequired(): boolean // If the meeting service is paid, the module must be activated to use it; otherwise, the free Jitsi service is used by default
}


export class JitsiMeetingLinkStrategy extends MeetingLinkStrategy {
  protected service = MeetingServiceType.JITSI
  private jitsiUrl = 'https://meet.jit.si/ROOM_NAME#config.startWithVideoMuted=true&userInfo.displayName="MEMBER_NAME"'

  async getMeetingUrl(): Promise<{
    meetingUrl: string | undefined
    error: MeetingError | undefined
  }> {
    const url = this.jitsiUrl
      .replace('ROOM_NAME', `${process.env.NODE_ENV === 'development' ? 'dev' : this.appId}-${this.params.memberId}`)
      .replace('MEMBER_NAME', this.params.hostMemberName)

    return {
      meetingUrl: url,
      error: undefined,
    }
  }

  protected needToCheckMeetingPeriod(): boolean {
    return true
  }

  protected isMeetingServiceModuleActivationRequired(): boolean {
    return false
  }
}

export class ZoomMeetingLinkStrategy extends MeetingLinkStrategy {
  protected service = MeetingServiceType.ZOOM

  protected needToCheckMeetingPeriod(): boolean {
    return true
  }

  protected isMeetingServiceModuleActivationRequired(): boolean {
    return true
  }
}

export class GoogleMeetMeetingLinkStrategy extends MeetingLinkStrategy {
  protected service = MeetingServiceType.GOOGLE_MEET

  protected needToCheckMeetingPeriod(): boolean {
    return false
  }

  protected isMeetingServiceModuleActivationRequired(): boolean {
    return true
  }
}



export class MeetingLinkStrategyFactory {
  private strategyMap: Record<MeetingServiceType, new (
    params: MeetingParams,
    appId: string,
    authToken: string | null,
    meetingServiceEnabledModules: boolean
  ) => MeetingLinkStrategy> = {
    [MeetingServiceType.JITSI]: JitsiMeetingLinkStrategy,
    [MeetingServiceType.ZOOM]: ZoomMeetingLinkStrategy,
    [MeetingServiceType.GOOGLE_MEET]: GoogleMeetMeetingLinkStrategy,
  };

  constructor(
    private service: MeetingServiceType,
    private params: MeetingParams,
    private appId: string,
    private authToken: string | null,
    private meetingServiceEnabledModules: boolean
  ) {}

  create(): MeetingLinkStrategy {
    const StrategyClass = this.strategyMap[this.service] || JitsiMeetingLinkStrategy;
    return new StrategyClass(
      this.params,
      this.appId,
      this.authToken,
      this.meetingServiceEnabledModules
    );
  }
}
