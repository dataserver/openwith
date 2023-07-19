
# Open With Web Extension (Windows)

A simple web extension that create new context menu option to open links with another web browsers like
Firefox, Chrome or Edge installed in your Windows computer.


The extension send a message via websocket with url and browser info to socket server runnig in your local machine
(ws://localhost:9090). Then pytthon open it using one of following browsers:

- Firefox
- Firefox - Private mode
- Google Chrome
- Google Chrome - Incognito mode
- Microsoft Edge
- Microsoft Edge - InPrivate mode

## GUI PySide6
GUI is written in PySide (PyQT)

    python app/main.py

## Only for Windows

In the server side only windows command lines are coded.

## HOW TO USE

1. Install extension
2. Start websocket server 

## Websocket Server

The websocket server written in Python and can easily be converted to executable using Pyinstaller
    
    pyinstaller main.spec

## License ##

[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)

This project is in the worldwide [public domain](LICENSE).

This project is in the public domain and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.