# UPCChatbot
Este chatbot fue creado para la Universidad Peruana de Ciencias Aplicadas para el curso de Tecnologías Móviles y Cloud del profesor Juan Manuel Cuya Cabanillas.

# Código fuente:
La fuente de inspiración para el código de este chatbot (y quién hizo el código que me ayudo a entender mejor los conceptos de tecnologías relacionadas a Watson Conversation pertenece a Priscilla Parodi, dejo su github a manera de crédito: https://gist.github.com/priscillaparodi)

# Características:
  Este chatbot recibe mensajes de voz de facebook. No funciona recibiendo archivos de audio (al menos no ha sido testeada intensivamnete, a veces funciona y a veces no)
  
  Este chatbot recibe mensajes de texto
  
# Prerrequisitos:
  1. Node-js
  2. Cuenta de bluemix (La de trial también funciona)
  3. NGROK para poder exponer Node.js a través de un tunnel
  4. Mucho amor por la investigación ;D
  
# Guía de configuración:
  UPDATE: Vídeo de youtube: https://youtu.be/T4pcNiLYXxw
  
  
  1. Descarga estos archivos en una carpeta (Por defecto será UPCChatbot)
  2. Sitúate en la carpeta en una línea de comandos CMD y escribe "npm install"
  3. Espera a que la instalación termine y NO CIERRES LA VENTANA
  4. En la misma ventana escribe "node app.js"
  5. Por defecto te dejé listo el puerto 3000. Corre NGROK con el comando "ngrok http 3000"
  6. Ahora tu chatbot está expuesto a la nube y listo para ser llamado desde facebook (Debido a que los demás pasos requieren ayuda visual, adjunto un vídeo con toda la configuración)
  
  # Agradecimientos
  
  Un agradecimiento muy grande a Franz Portocarrero porque tuvo que escucharme hablarme durante días sobre chatbots y todavía me dirige la palabra.

