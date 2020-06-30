/**
 ***************************************
 *
 * @file LEDLighting.ino
 * @brief LED控制演示程序
 * 
 * 实验程序将演示使用KD_LED库控制LED模块的方法。
 * 
 * @author gsh
 * @version 1.0
 * @date 2016.9.30
 *
 ***************************************
 */

#include<KD.h>
#include<KD_LED.h>

KD_LED led;

void setup()
{
  led.Init(D9);
}

void loop()
{
	led.LightUp(1);
	delay(1000);
	led.LightUp(0);
	delay(1000);
}