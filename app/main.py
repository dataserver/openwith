#  https://github.com/vuquangtrong/demo_websocket_server_tkinter_gui

import asyncio
import json
import os
import sys
import threading
import tkinter as tk
from datetime import datetime

import websockets

PORT = 9090


def is_json(myjson) -> bool:
    try:
        json.loads(myjson)
    except ValueError as e:
        return False
    return True


class WebSocketThread(threading.Thread):
    def __init__(self, name) -> None:
        threading.Thread.__init__(self)
        self.stop_event = threading.Event()
        self.name = name
        self.USERS = set()
        print("Started:", self.name)

    def run(self) -> None:
        self.loop = asyncio.new_event_loop()
        stop = self.loop.run_in_executor(None, self.stop_event.wait)
        self.loop.run_until_complete(self.listener_server(stop))  # type: ignore
        self.loop.run_forever()

    async def listener_server(self, stop) -> None:
        async with websockets.serve(self.listen, "localhost", PORT):  # type: ignore
            await stop
        self.loop.stop()

    async def listen(self, websocket, path) -> None:
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
                # print(f"close: {ts}", websocket)
                break

        self.USERS.remove(websocket)

    # message handler
    async def handle_message(self, websocket, data) -> None:
        ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
        if is_json(data):
            json_data = json.loads(data)
            # print("json data:", json_data)
            if json_data["data"]["type"] == "browser":
                url = json_data["data"]["url"]
                if json_data["data"]["app"] == "browser-chrome":
                    cmd = "start chrome --new-window {}".format(url)
                elif json_data["data"]["app"] == "browser-chrome-incognito":
                    cmd = "start chrome --incognito {}".format(url)
                elif json_data["data"]["app"] == "browser-firefox":
                    cmd = "start firefox --new-window {}".format(url)
                elif json_data["data"]["app"] == "browser-firefox-incognito":
                    cmd = "start firefox --private-window {}".format(url)
                elif json_data["data"]["app"] == "browser-edge":
                    cmd = "start msedge --new-window {}".format(url)
                elif json_data["data"]["app"] == "browser-edge-incognito":
                    cmd = "start msedge --inprivate {}".format(url)
                else:
                    cmd = None
                if cmd:
                    app.append_text(f"{ts} - {cmd}")
                    os.system(cmd)
        else:
            app.append_text(f"{ts} - {data}")

    def stop_server(self) -> None:
        self.stop_event.set()
        app.append_text("stop_server()")


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
        threadWebSocket.stop_server()
        self.destroy()
        sys.exit()

    def close_window(self) -> None:
        threadWebSocket.stop_server()
        self.destroy()
        sys.exit()


if __name__ == "__main__":
    threadWebSocket = WebSocketThread("websocket_server")
    threadWebSocket.start()
    app = App()
    app.mainloop()
