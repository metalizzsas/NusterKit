#! /bin/bash

echo "Grabbing latest nuster-desktop version from github..."

if [[ -d ./nuster-desktop/ ]]
then
    echo "Repo already exists, deleting it"
    rm -rf ./nuster-desktop/
fi

git clone git@github.com:metalizzsas/NusterDesktop.git ./nuster-desktop/