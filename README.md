SCRIPTBROADCAST
---------------

scriptboradcast broadcasts typescripts recorded with `script` command to any
numbers of recipients.

SYNOPSIS
========

    scriptbroadcast [port] [timing file] [typescript file]

5000 is the default port, timing is the default timing file and typescript is
the default typescript file.

USAGE
=====

You can record your timing and typescript file in this way:

    script -qtf 2> timing

Then run the following command to fire up the broadcasting server with default
parameters:

    scriptbroadcast

Run the following command elsewhere will play your typescript:

    nc yourip 5000


SEE ALSO
========

`script(1)`, `scriptreplay(1)`

scriptreplay is inspired by [my CommandLineFu
command](http://www.commandlinefu.com/commands/view/6788) and the comments.

LICENSE
=======
scriptbraodcast is licensed under "MIT/X11" license, see LICENSE file.
