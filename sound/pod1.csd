<CsoundSynthesizer>
<CsOptions>
-odac   


</CsOptions>
<CsInstruments>
sr        =        44100   
kr        =        44100
nchnls    =        2
0dbfs    =         1.0

;i-rate globals
gihandle OSCinit 7770

gibasefreq init 0 ; p4 from i-statement
giscale init 0    ; p5
gifn init 0       ; p6

;i-rate globals
gisimthresh init 0 ; p7

;k-rate globals
gksim init 0   ; from OSC input
gktrigger init 0    
gimodfreq init 0


;-----------------------------------------
instr 1 ;start
	kCount init 0
	konoff init 0
	kmode init 0
	gibasefreq  = p4
	giscale = p5
	gisimscale = p6
	gifn = p7
	gidelbase = p8
	gicarfn = p9
	gimodfreq = p10
	gimodamp = p11
	gimod_ifn = p12
	gipulse_env_amp = p13
	gipulse_shape = p14
	gilowpulse = p15
	gihighpulse = p16
	gisimthresh = p17; p17

 

	
	gkf1 init 0  ; from OSC input	
	gkf2 init 0  ; from OSC input
	gkf3 init 0  ; from OSC input
	gkf4 init 0  ; from OSC input
	gkf5 init 0  ; from OSC input
	gkf6 init 0  ; from OSC input
	gkf7 init 0  ; from OSC input
	gkf8 init 0  ; from OSC input

 	kk OSClisten gihandle, "/eeg", "iiiiiiiii", kCount, gkf1, gkf2, gkf3, gkf4, gkf5, gkf6, gkf7, gkf8
	kk OSClisten gihandle, "/onoff", "i", konoff
	kk OSClisten gihandle, "/similarity", "f", gksim
	
	
if (kk == 0) goto no_new_data
no_new_data:

;print here and see  no kf1, kf2, etc. have been set/received	
	;printks "/eeg is %i %i %i %i %i\\n", 0, /eeg
	printks "OSC data is %i %i %i %i %i %i %i %i\\n", 2, gkf1, gkf2, gkf3, gkf4, gkf5, gkf6, gkf7, gkf8
	printks "kf1 and kf2 are %i %i\\n", 2,   gkf1, gkf2

  ;; FIGURE OUT IF THE MODE HAS CHANGED
		if (konoff == 0) then 
			gktrigger = 0
		elseif (gksim  >= gisimthresh ) && (konoff == 1) then
			gktrigger = 333 
		elseif (gksim < gisimthresh) && (konoff == 1) then
			gktrigger = 222
		endif

  ;; HANDLE IF NEW MODE HAS CHANGED
  if (gktrigger != kmode) then
    if(kmode > 0) then
      ;; turn off current note
      turnoff2 kmode, 2, 1
    endif

     ;; turn on process based on similarity value
  if(gktrigger == 333) then      ;   p4        p5         p6        p7        p8                p9             p10        p11
      event "i", gktrigger, 0, 30600, gicarfn, gimodfreq, gimodamp, gimod_ifn, gipulse_env_amp, gipulse_shape, gilowpulse, gihighpulse
          
    ;sonification      
  elseif(gktrigger == 222) then
	  event "i", gktrigger, 0, 30600
    endif
    kmode = gktrigger
  endif

endin

;---------------------------------------------
instr 222 ; 
	asig0 oscili .05, gibasefreq, gifn
 	asig1 oscili (port(gkf1, .0001) / 18000000) * giscale, gibasefreq, gifn
 	asig2 oscili (port(gkf2, .0001) / 18000000) * giscale, gibasefreq * 2, gifn 	
 	asig3 oscili (port(gkf3, .0001) / 18000000) * giscale, gibasefreq * 3, gifn
 	asig4 oscili (port(gkf4, .0001) / 18000000) * giscale, gibasefreq * 4, gifn
 	asig5 oscili (port(gkf5, .0001) / 18000000) * giscale, gibasefreq * 5, gifn
 	asig6 oscili (port(gkf6, .0001) / 18000000) * giscale, gibasefreq * 6, gifn
 	asig7 oscili (port(gkf7, .0001) / 18000000) * giscale, gibasefreq * 7, gifn
 	asig8 oscili (port(gkf8, .0001) / 18000000) * giscale, gibasefreq * 8, gifn
 	
	asig = asig0 + asig1 + asig2 + asig3 + asig4 + asig5 + asig6 + asig7 + asig8
 
 	acomp oscili .8, 400, 1
 	abal balance asig, acomp

	afiltsig3 butlp abal, 3000
	afiltsig2 butlp afiltsig3, 3000 	
	afiltsig butlp afiltsig2, 3000
		

	adelay1 delay afiltsig, gidelbase
	adelay2 delay afiltsig, gidelbase * .2
	adelay3 delay afiltsig, gidelbase * .3	
	adelay4 delay afiltsig, gidelbase * .4	
	adelay5 delay afiltsig, gidelbase * .5		
	adelay6 delay afiltsig, gidelbase * .6			
	adelay7 delay afiltsig, gidelbase * .7	
	adelay8 delay afiltsig, gidelbase * .8	

	adelays = adelay1 + adelay2 + adelay3 + adelay4 + adelay5 + adelay6 + adelay7 + adelay8 



 	abal2 balance adelays, acomp
	asig2 = abal2

 asig2 *= linsegr(0, .33, 0, 1, 1, 3, 0)
 outc(asig2) 

endin

;----------------------------------------------------
instr 333 ;similarity	
		
	kpulse_freq scale gksim, p11, p10
 	
	kpulse_env oscili p8, kpulse_freq, p9
	amod oscili p6, p5, p7
	amod2 = amod 

	acar oscili gisimscale * kpulse_env,  gibasefreq + amod2, p4
		
	asig = acar * linsegr(0, 1,    1,   2,    0)
 outc(asig)
endin


</CsInstruments>
<CsScore>
f1 0 512 10 1
f5 0 1025 7  0.01    150 .5    100 1    230 1  100 .4  445 0.01 ;exponential shark fin

;           freq      amp simamp ifn idel   carifn  modfreq modamp modifn pulseNVamp pulseshape minpulse pulsehigh simthr
;           4         5     6     7    8     9       10      11      12    13          14        15        16       17
i1 0 3000     146.83 .05   2.7    1    .8     1      73.41     25     1     1           5        .7          1      .8
i1 0.153 3000 73.42  .05   2.7    1    .68    1      36.71     25     1     1           5        .7          1      .8



</CsScore>
</CsoundSynthesizer>
<bsbPanel>
 <label>Widgets</label>
 <objectName/>
 <x>100</x>
 <y>100</y>
 <width>320</width>
 <height>240</height>
 <visible>true</visible>
 <uuid/>
 <bgcolor mode="nobackground">
  <r>255</r>
  <g>255</g>
  <b>255</b>
 </bgcolor>
</bsbPanel>
<bsbPresets>
</bsbPresets>
