/**
 ***************************************
 *
 * @file Buzzing.ino
 * @brief 蜂鸣器模块使用演示程序
 * 
 * 实验程序将演示使用KD_Buzzer库控制蜂鸣器模块的方法。
 * 
 * @author gsh
 * @version 1.0
 * @date 2016.9.30
 *
 ***************************************
 */
 
#include <KD.h>
#include <KD_Buzzer.h>

KD_Buzzer buzzer;

void setup()
{
	// SIG->D9
	buzzer.Init(D9);
}

void loop()
{ 
	buzzer.Sound(1);
	delay(1000);
	buzzer.Sound(0);
	delay(1000);

}
