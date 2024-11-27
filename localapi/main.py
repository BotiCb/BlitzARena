import asyncio
import websockets

from websocket.websocket_service import start_server





# Main coroutine
async def main():
    await start_server()

if __name__ == "__main__":
    asyncio.run(main())
