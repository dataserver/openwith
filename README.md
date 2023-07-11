
# Open With Web Extension (Windows)

A simple web extension that create new context menu option to open links with another web browsers like
Firefox, Chrome or Edge installed in your Windows computer.


The extensino send the url info using a websocket connection to an app runnig in your local machine
(ws://localhost:9090) that then open it using one of following browsers:

- Firefox
- Firefox - Private mode
- Google Chrome
- Google Chrome - Incognito mode
- Microsoft Edge
- Microsoft Edge - InPrivate mode

## Only for Windows

In the main.py file only windows command lines are coded.

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