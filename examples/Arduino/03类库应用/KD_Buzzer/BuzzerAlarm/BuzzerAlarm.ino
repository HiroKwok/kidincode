/**
 ***************************************
 *
 * @file BuzzerAlarm.ino
 * @brief 蜂鸣警报器演示程序
 * 
 * 实验程序将演示使用KD_Buzzer库控制蜂鸣器模块响起警报的方法。
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
	buzzer.Alert(500);
}
