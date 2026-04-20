import { createServer, type Server as HttpServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { AddressInfo } from 'net'
import { registerSocketHandlers } from '../../server/socket'

export interface GpsServer {
  url: string
  stop: () => Promise<void>
}

export function startGpsServer(): Promise<GpsServer> {
  return new Promise((resolve, reject) => {
    const httpServer: HttpServer = createServer()
    const io = new SocketIOServer(httpServer, {
      cors: { origin: '*' },
      path: '/socket.io/',
    })
    registerSocketHandlers(io)

    httpServer.on('error', reject)
    httpServer.listen(0, '127.0.0.1', () => {
      const addr = httpServer.address() as AddressInfo
      const url = `http://127.0.0.1:${addr.port}`
      const stop = () =>
        new Promise<void>((resolveStop) => {
          io.close(() => {
            httpServer.close(() => resolveStop())
          })
        })
      resolve({ url, stop })
    })
  })
}
