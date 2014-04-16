#include <pebble.h>
#include "app.h"
#include "message_handler.h"

static void init(void){
  app_init();
  message_handler_init();
}

static void deinit(void){
  app_deinit();
}

int main(void){
  init();
  app_event_loop();
  deinit();
}
