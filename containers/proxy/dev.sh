#!/bin/zsh
cp ./nginx.dev.conf /opt/homebrew/etc/nginx/nginx.conf
brew services restart nginx