#! /bin/bash

echo "Grabbing latest nuster-desktop version from github..."

if [[ -d ./nuster-desktop/repo ]]
then
    echo "Repo already exists, deleting it"
    rm -rf ./nuster-desktop/repo
fi

git clone git@github.com:metalizzsas/NusterDesktop.git ./nuster-desktop/repo