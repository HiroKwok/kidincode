/**
 ***************************************
 *
 * @file LEDFlashing.ino
 * @brief LED闪灯控制演示
 * 
 * 实验程序将演示使用KD_LED库控制LED模块进行闪烁的方法。
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
	led.Flash(500);
}
