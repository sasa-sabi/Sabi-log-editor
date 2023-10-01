# Sabi-log-editor

## Introduction

This editor can make html file in sabi-log.net format.

## Setting

Rewrite the notionToken and notionDatabaseID in out/text/notionAPI.txt as appropriate.

This is not necessary if file sharing via NotionAPI is not used.

## Function
- ctrl + shift + N, cmd + shift + N

Download Notion files in markdown format.

It also supports the additional notations shown later.

(You need to have completed the prerequisites before you can use this function.)

---

- ctrl + shift + M, cmd + shift + M

Converts markdown files to html files and displays them in real-time.

This can be done by opening two tabs.

---

- ctrl + shift + L, cmd + shift + L

Download the html file you have created.

## Additional notation

- -t(name)「(sentence)」

Add a callout.

Register the name and image in the dictionary that exists in src/func/convert.ts.

To add a new person's name and image, add a (name): "(image_url)".

- -memo「(sentence)」

Add a note.

- \-\-\-

Separate the window.

- \-\-p

Separate pages.

The output html file can also be separated.

- \-p (sentence)

Add headings.

Smaller than h1 and h2, just enough to indicate a section.

## Requirements

Not particularly.

## Known Issues

I don't know anything about it.

## Release Notes

### 1.0.0

Initial release of sabi-log-editor.

This is a limited-function version.

It is not possible to move markdown files to Notion or to generate a list of articles.

## Other

For any other code questions, please contact us on Twitter (@today_chokankyo).