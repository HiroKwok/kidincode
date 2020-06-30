/**
 ***************************************
 *
 * @file IRTest.ino
 * @brief 红外接收模块应用演示
 * 
 * 实验程序将演示使用KD_IR库获取红外信号接收模块反馈键码的方法。
 * 
 * @author gsh
 * @version 1.0
 * @date 2016.9.30
 *
 ***************************************
 */

#include <KD.h>
#include <KD_IR.h>

KD_IR ir;

void setup()
{
	// SIG->D2
	ir.Init(D2);
}

void loop()
{
	ir.Read();
  
	//Serial.println(ir.GetCode());
}
