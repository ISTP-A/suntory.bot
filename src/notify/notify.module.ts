import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { DiscordModule } from '../discord/discord.module'
import { NotifyService } from './notify.service'

@Module({
    imports: [ScheduleModule.forRoot(), DiscordModule],
    providers: [NotifyService],
})
export class NotifyModule { }
