@echo off
rd /s/q dist
cd ../../
cmd /k gulp -"%~dp0"