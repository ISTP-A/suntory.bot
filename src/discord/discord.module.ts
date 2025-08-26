import { Module } from '@nestjs/common'
import { DiscordClient } from './discord.client'

@Module({
    providers: [DiscordClient],
    exports: [DiscordClient],
})
export class DiscordModule { }
