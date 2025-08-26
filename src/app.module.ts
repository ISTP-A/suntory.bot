import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { DiscordModule } from './discord/discord.module'
import { NotifyModule } from './notify/notify.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DiscordModule,
    NotifyModule,
  ],
})
export class AppModule { }
