/**
 ***************************************
 *
 * @file LEDBreathing.ino
 * @brief LED呼吸灯功能演示
 * 
 * 实验程序将演示使用KD_LED库调用呼吸灯功能的方法。
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
	led.FadeIn(10);
	delay(1000);
	led.FadeOut(10);
	delay(1000);
}

