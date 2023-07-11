#  https://github.com/vuquangtrong/demo_websocket_server_tkinter_gui

import asyncio
import json
import sys
import threading
import tkinter as tk
from datetime import datetime

import websockets

WS_HOST = "localhost"
WS_PORT = 9090
DEBUG = False


def is_json(myjson) -> bool:
    try:
        json.loads(myjson)
    except ValueError as e:
        return False
    return True


class WebSocketThread:
    def __init__(self, name) -> None:
        self.name = name
        self.USERS = set()
        print("Started:", self.name)

    def start(self):
        server = threading.Thread(target=self.server, daemon=True)
        server.start()

    def server(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        ws_server = websockets.serve(self.listen, WS_HOST, WS_PORT)  # type: ignore
        loop.run_until_complete(ws_server)
        loop.run_forever()
        loop.close()

    async def listen(self, websocket) -> None:
        self.USERS.add(websocket)
        # this loop to get message from client #
        while True:
            try:
                msg = await websocket.recv()
                if msg is None:
                    break
                await self.handle_message(websocket, msg)

            except websockets.exceptions.ConnectionClosed:  # type: ignore
                ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
                app.append_text(f"{ts} - closed - {websocket}")
                if DEBUG:
                    print(f"close: {ts}", websocket)
                break

        self.USERS.remove(websocket)

    # message handler
    async def handle_message(self, websocket, data) -> None:
        ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
        if DEBUG:
            print(f"websocket: {websocket}")
            print(f"data: {data}")

        if is_json(data):
            json_data = json.loads(data)
            if json_data["data"]["category"] == "cat-a":
                url = json_data["data"]["url"]
                if json_data["data"]["action"] == "action-a":
                    action = "some action A"
                elif json_data["data"]["action"] == "action-b":
                    action = "some action B"
                else:
                    action = None
                app.append_text(f"{ts} - {action}")

            elif json_data["data"]["category"] == "cat-a":
                pass
            else:
                pass
        else:
            app.append_text(f"{ts} - {data}")


class App(tk.Tk):
    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)

        self.title("Open With")
        self.geometry("300x200")
        # self.resizable(False, False)
        self.protocol("WM_DELETE_WINDOW", self.on_window_delete)

        self.label = tk.Label(self, text="Log")
        self.label.pack()

        self.textbox = tk.Text(self, height=5)
        self.textbox.pack(expand=tk.YES, fill=tk.BOTH)

        self.btn_stop = tk.Button(self, text="Close", command=self.close_window)
        self.btn_stop.pack(padx=10, pady=3, anchor="e")

    def append_text(self, txt) -> None:
        self.textbox.insert(tk.END, "\n" + txt)

    def on_window_delete(self) -> None:
        app.append_text("Terminate")
        self.destroy()
        sys.exit()

    def close_window(self) -> None:
        app.append_text("Terminate")
        self.destroy()
        sys.exit()


if __name__ == "__main__":
    threadWebSocket = WebSocketThread("websocket_server")
    threadWebSocket.start()
    app = App()
    app.mainloop()
