#pragma once

extern GColor bg_color; 
extern GColor txt_color;
extern bool animated;
extern bool fullsccreen;

void app_init(void);
void app_deinit(void);
void set_info_text(char text[]);