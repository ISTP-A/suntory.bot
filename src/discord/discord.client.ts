import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { Client, GatewayIntentBits, TextChannel } from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config()

@Injectable()
export class DiscordClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DiscordClient.name)
    public readonly client = new Client({
        intents: [GatewayIntentBits.Guilds],
    })

    async onModuleInit() {
        this.client.once('clientReady', () => {
            this.logger.log(`Logged in as ${this.client.user?.tag}`)
        })

        try {
            await this.client.login(process.env.DISCORD_TOKEN)
        } catch (e) {
            this.logger.error('Discord login failed', e as Error)
            throw e;
        }
    }

    async onModuleDestroy() {
        await this.client.destroy()
    }

    getTextChannel(channelId: string): TextChannel | null {
        const ch = this.client.channels.cache.get(channelId)
        if (ch && ch.isTextBased()) return ch as TextChannel
        return null
    }
}
