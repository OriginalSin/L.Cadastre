@echo off
git submodule sync
git submodule update --init --recursive

call npm i -g

jake
