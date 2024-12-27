#!/bin/sh

./vendor/bin/sail up -d
./vendor/bin/sail artisan storage:link