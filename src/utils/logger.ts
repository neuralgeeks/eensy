/* eslint-disable @typescript-eslint/no-explicit-any */
import { ISettingsParam, Logger } from 'tslog'

const refreshSettings = (target: any, memberName: string) => {
  let original: any = target[memberName]

  Object.defineProperty(target, memberName, {
    set: (newValue: any) => {
      original = newValue
    },
    get: function () {
      if (AppLogger.settings) {
        const that = this as AppLogger
        that.setSettings(AppLogger.settings)
      }

      return original
    },
  })
}

export default class AppLogger extends Logger {
  public static settings?: ISettingsParam = {
    displayInstanceName: true,
    displayFunctionName: false,
    displayFilePath: 'hideNodeModulesOnly',
  }
  public static setup?: (logger: AppLogger) => void

  constructor(settings?: ISettingsParam, setup?: (logger: AppLogger) => void) {
    super(settings || AppLogger.settings)
    AppLogger.settings = settings || AppLogger.settings
    AppLogger.setup = setup || AppLogger.setup
    AppLogger.setup?.(this)
  }

  @refreshSettings
  debug = super.debug

  @refreshSettings
  info = super.info

  @refreshSettings
  silly = super.silly

  @refreshSettings
  trace = super.trace

  @refreshSettings
  warn = super.warn

  @refreshSettings
  error = super.error

  @refreshSettings
  fatal = super.fatal
}

export function appLoggerFactory(
  instanceName: string,
  productionMode: boolean
) {
  return new AppLogger({
    ...AppLogger.settings,
    instanceName,
    minLevel: productionMode ? LogLevels.ERRORS : LogLevels.ALL,
  })
}

export enum LogLevels {
  ERRORS = 'error',
  ALL = 'silly',
}
