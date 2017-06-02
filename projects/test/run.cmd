@echo off
rd /s/q dist
cd ../../
cmd /k gulp -1"%~dp0"