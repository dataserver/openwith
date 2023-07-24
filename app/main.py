# https://stackoverflow.com/questions/59157478/how-to-pass-data-between-main-widget-and-qobject-that-are-in-different-classes
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

from PySide6 import QtCore, QtNetwork, QtWebSockets
from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon, QScreen
from PySide6.QtWidgets import (
    QApplication,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QPushButton,
    QSizePolicy,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

BASE_PATH = Path(__file__).parent
ICON_PATH = Path(BASE_PATH, "resources", "window.ico")
WS_HOST = QtNetwork.QHostAddress.LocalHost
WS_PORT = 9090
DEBUG = False


def is_json(myjson) -> bool:
    try:
        json.loads(myjson)
    except ValueError as e:
        return False
    return True


class QHSeperationLine(QFrame):
    """
    a horizontal seperation line
    """

    def __init__(self) -> None:
        super().__init__()
        self.setMinimumWidth(1)
        self.setFixedHeight(20)
        self.setFrameShape(QFrame.HLine)
        self.setFrameShadow(QFrame.Sunken)
        self.setSizePolicy(QSizePolicy.Preferred, QSizePolicy.Minimum)


class Window(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("Websocket Server")
        self.setWindowIcon(QIcon(str(ICON_PATH)))
        self.resize(500, 600)

        primary = QWidget()
        frame = QVBoxLayout()
        lyt_head = QHBoxLayout()
        lyt_body = QGridLayout()
        lyt_footer = QGridLayout()

        # head widgets
        label_heading = QLabel(text="Log")
        label_heading.setAlignment(Qt.AlignCenter)
        lyt_head.addWidget(label_heading)

        # body
        self.textarea_log = QTextEdit()
        lyt_body.addWidget(self.textarea_log)

        # footer widgets
        btn_quit = QPushButton(text="Quit")
        btn_quit.setProperty("class", "warning")
        btn_quit.clicked.connect(self.app_quit)  # type: ignore
        lyt_footer.addWidget(btn_quit, 0, 0)

        frame.addLayout(lyt_head)
        frame.addLayout(lyt_body)
        frame.addWidget(QHSeperationLine())
        frame.addLayout(lyt_footer)

        primary.setLayout(frame)
        self.setCentralWidget(primary)
        self.show()
        self.window_to_center()

    @QtCore.Slot(str)
    def on_status_changed(self, message: str) -> None:
        """
        Append message to QTextEdit (textarea) widget
        """
        self.textarea_log.append(message)

    def window_to_center(self) -> None:
        """
        Center window to the middle o screen
        """
        center = QScreen.availableGeometry(QApplication.primaryScreen()).center()
        geo = self.frameGeometry()
        geo.moveCenter(center)
        self.move(geo.topLeft())

    def app_quit(self) -> None:
        """
        Quit window GUI
        """
        app.quit()


class MyServer(QtCore.QObject):
    """Websocket Server class.

    Attributes:
        signal_status_changed: A signal to connect to other classes.
        server: ws instance
    """

    signal_status_changed = QtCore.Signal(str)

    def __init__(
        self,
        server_name: str,
        secure_mode: QtWebSockets.QWebSocketServer.SslMode,
        parent: Optional[QtCore.QObject] = None,
    ):
        """
        Initializes websocket server
        """
        super().__init__(parent)
        self.clients = set()
        self.server = QtWebSockets.QWebSocketServer(server_name, secure_mode, parent)
        self.server.closed.connect(QtCore.QCoreApplication.quit)
        if self.server.listen(WS_HOST, WS_PORT):
            print(
                "Connected: "
                + self.server.serverName()
                + " : "
                + self.server.serverAddress().toString()
                + ":"
                + str(self.server.serverPort())
            )
        else:
            print(f"error: {self.server.errorString()}")
        self.server.newConnection.connect(self.on_new_connection)
        print("isListening: ", self.server.isListening())

    @QtCore.Slot()
    def on_new_connection(self):
        """
        callback on websocket connection
        """
        ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
        client = self.server.nextPendingConnection()
        client.identifier = QtCore.QUuid.createUuid().toString(QtCore.QUuid.Id128)
        client.textMessageReceived.connect(self.handler_str_message)
        client.binaryMessageReceived.connect(self.handler_binary_message)
        client.disconnected.connect(self.on_disconnected)
        self.clients.add(client)
        self.signal_status_changed.emit(f"{ts} - connected: client-{client.identifier}")

    @QtCore.Slot(str)
    def handler_str_message(self, message):
        """
        callback for each websocket str message received
        """
        ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
        client = self.sender()
        if DEBUG:
            print(f"client.identifier: {client.identifier}")
            print(f"message: {message}")
        if isinstance(client, QtWebSockets.QWebSocket):
            # client.sendTextMessage(message)
            if is_json(message):
                json_data = json.loads(message)
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
                        self.signal_status_changed.emit(f"{ts} - executed: {cmd}")
                        os.system(cmd)

                elif json_data["data"]["type"] == "echo":
                    client.sendTextMessage(message)
                    self.signal_status_changed.emit(
                        f"{ts} - echo to client-{client.identifier}: {message}"
                    )
                else:
                    pass
            else:
                self.signal_status_changed.emit(
                    f"{ts} - client-{client.identifier} str: {message}"
                )

    @QtCore.Slot(QtCore.QByteArray)
    def handler_binary_message(self, message):
        """
        callback for each websocket binary message received
        """
        ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
        client = self.sender()
        if DEBUG:
            print(f"client.identifier: {client.identifier}")
            print(f"message: {message}")
        if isinstance(client, QtWebSockets.QWebSocket):
            # client.sendBinaryMessage(message)
            print(f"{ts} - client-{client.identifier} binary: {message}")

    @QtCore.Slot()
    def on_disconnected(self):
        """
        callback for each websocket disconnection
        """
        ts = datetime.today().strftime("%Y-%m-%d %H:%M:%S")
        client = self.sender()
        if isinstance(client, QtWebSockets.QWebSocket):
            self.clients.remove(client)
            self.signal_status_changed.emit(
                f"{ts} - Disconnected: client-{client.identifier}"
            )
            client.deleteLater()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    gui = Window()
    server = MyServer(
        "My Websocket Server",
        QtWebSockets.QWebSocketServer.NonSecureMode,
    )
    server.signal_status_changed.connect(gui.on_status_changed)
    sys.exit(app.exec())
