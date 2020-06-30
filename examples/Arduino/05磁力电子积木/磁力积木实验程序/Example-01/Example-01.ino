#include<KD.h>  
#include<KD_LED.h>  
  
KD_LED led;  
	  
void setup()  
{  
    led.Init(D9);  
	  
    // 磁力电子积木案例添加这行
    pinMode(5, OUTPUT);
}  
	  
void loop()  
{  
    led.LightUp(1);
    
    delay(1000);  
    
    led.LightUp(0); 
    
    delay(1000);  
} 
