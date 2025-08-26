import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { DiscordClient } from '../discord/discord.client'
import { MessageFlags, TextChannel } from 'discord.js'

type LogType = 'LOG' | 'DEBUG' | 'ERROR' | 'WARN'

const TZ = 'Asia/Seoul'

const MAIN_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID!
const HEARTBEAT_CHANNEL_ID = MAIN_CHANNEL_ID

const CRON_HOURLY_ON_THE_HOUR = '0 0 * * * *'
const CRON_SPECIFIC_FIELD_BOSS = '0 0 12,18,20,22 * * *'
const CRON_HEARTBEAT_EVERY_30M = '0 */30 * * * *'

const BARRIER_MESSAGES: readonly string[] = [
    '⚠️ 결계 출현! 놓치면 1시간 기다려야 해요!',
    '「딩-동! 결계가 깨어난다!」',
    '정각 종소리와 함께, 결계가 요동칩니다!',
]

const FIELD_BOSS_MESSAGES: readonly string[] = [
    '⏰ 필드보스 알림! 준비하세요 ⚔️',
    '필드보스의 기운이 감돌기 시작합니다… 결계 돌파!',
]

@Injectable()
export class NotifyService {
    private readonly logger = new Logger(NotifyService.name)

    constructor(private readonly discord: DiscordClient) { }

    @Cron(CRON_HOURLY_ON_THE_HOUR, { timeZone: TZ })
    async sendBarrierNotification() {
        await this.send({
            channelId: MAIN_CHANNEL_ID,
            content: this.wrapTime(randomOf(BARRIER_MESSAGES)),
            quiet: false,
            logContext: 'Barrier',
        })
    }

    @Cron(CRON_SPECIFIC_FIELD_BOSS, { timeZone: TZ })
    async sendFieldBossNotification() {
        await this.send({
            channelId: MAIN_CHANNEL_ID,
            content: this.wrapTime(randomOf(FIELD_BOSS_MESSAGES)),
            quiet: false,
            logContext: 'FieldBoss',
        })
    }

    @Cron(CRON_HEARTBEAT_EVERY_30M, { timeZone: TZ })
    async sendHeartbeat() {
        await this.send({
            channelId: HEARTBEAT_CHANNEL_ID,
            content: this.wrapTime(`✅ Bot alive | ${this.now()}`),
            quiet: true,
            logContext: 'Heartbeat',
        })
    }

    private async send(opts: {
        channelId: string
        content: string
        quiet?: boolean
        logContext?: string
    }) {
        const { channelId, content, quiet = false, logContext = 'Notify' } = opts

        if (!channelId) {
            this.log('WARN', logContext, 'Channel ID is empty (env missing?)')
            return
        }

        const ch = this.getTextChannel(channelId)

        if (!ch) {
            this.log('WARN', logContext, `Channel not found: ${channelId}`)
            return
        }

        try {
            if (quiet) {
                await ch.send({ content, flags: MessageFlags.SuppressNotifications })
            } else {
                await ch.send(content)
            }
            this.log('LOG', logContext, `Sent message to ${channelId} (quiet=${quiet})`)
        } catch (err) {
            this.log('ERROR', logContext, `Failed to send message to ${channelId}`, err as Error)
        }
    }

    private getTextChannel(channelId: string): TextChannel | null {
        const ch = this.discord.getTextChannel(channelId)
        return ch && ch.isTextBased() ? (ch as TextChannel) : null
    }

    private now() {
        return new Date().toLocaleString('ko-KR', { hour12: false })
    }

    private wrapTime(message: string) {
        return `[TIME:: ${this.now()}] ${message}`
    }

    private log(type: LogType, ctx: string, msg: string, err?: Error) {
        const line = `[${type}] [${ctx}] ${this.wrapTime(msg)}`
        switch (type) {
            case 'LOG': return this.logger.log(line)
            case 'DEBUG': return this.logger.debug(line)
            case 'WARN': return this.logger.warn(line)
            case 'ERROR': return this.logger.error(line, err)
        }
    }
}

function randomOf<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}
