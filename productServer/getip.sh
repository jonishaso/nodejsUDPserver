#!/bin/bash

ipaddr=`ifconfig | grep "inet addr:" | cut -d: -f2 | cut -d' ' -f1`
ipall=`echo $ipaddr | sed 's/ /,/'`
sed -i "s/^bind_ip=.*$/bind_ip=$ipall/" mongo.config

