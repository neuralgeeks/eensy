export default async () => {
  // turn off services
  global.__SERVICESFORK__?.kill()
  global.__SERVICESFORK__?.stdout?.destroy()
  global.__SERVICESFORK__?.stderr?.destroy()
  global.__SERVICESFORK__?.stdin?.destroy()
}
