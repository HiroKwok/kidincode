 
#include <KD.h>  
#include <KD_Buzzer.h>  
	  
KD_Buzzer buzzer;  
  
void setup()  
{  
    // SIG->D9  
    buzzer.Init(D9);  
	      
    // 磁力电子积木案例添加这行  
    pinMode(5, OUTPUT);  
}  
  
void loop()  
{   
    buzzer.Sound(1);
    
    delay(1000);  
    
    buzzer.Sound(0); 
    
    delay(1000);  
} 
 
