	  
#include <KD.h>  
#include <KD_IR.h>  
	  
KD_IR ir;  
	  
void setup()  
{  
	// SIG->D5  
	ir.Init(D5);  
}  
  
void loop()  
{  
	ir.Read();  
	    
	//Serial.println(ir.GetCode()); 
} 
