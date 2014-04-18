#include <pebble.h>
#include "window/handler.h"
#include "messages/handler.h"

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
