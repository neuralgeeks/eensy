export default function appargs(process: NodeJS.Process) {
  const [name, port, listen] = process.argv.slice(2)
  return { name, port, listen: Boolean(listen) }
}
