import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Join Room
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);

    console.log(
      `${client.id} joined room ${roomId}`,
    );
  }

  // Chat Messages
  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @MessageBody() data: any,
  ) {
    console.log(
      'MESSAGE:',
      data,
    );

    this.server
      .to(data.roomId)
      .emit(
        'receiveMessage',
        data,
      );
  }

  // WebRTC Offer
  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    console.log(
      'OFFER:',
      payload.roomId,
    );

    client
      .to(payload.roomId)
      .emit(
        'offer',
        payload,
      );
  }

  // WebRTC Answer
  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    console.log(
      'ANSWER:',
      payload.roomId,
    );

    client
      .to(payload.roomId)
      .emit(
        'answer',
        payload,
      );
  }

  // ICE Candidate Exchange
  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    client
      .to(payload.roomId)
      .emit(
        'ice-candidate',
        payload,
      );
  }

  // End Session
  @SubscribeMessage('end-session')
  handleEndSession(
    @MessageBody() roomId: string,
  ) {
    console.log(
      'SESSION ENDED:',
      roomId,
    );

    this.server
      .to(roomId)
      .emit(
        'session-ended',
      );
  }
}