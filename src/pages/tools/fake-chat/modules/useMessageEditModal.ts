/**
 * useMessageEditModal - 消息编辑弹窗逻辑
 *
 * 表单状态管理：初始化、图片选择、提交
 */

import type { ChatMessage, MessageType } from '../types';
import { genId } from '../constants';

interface MessageFormData {
  type: MessageType;
  senderId: string;
  text: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  voiceDuration: number;
  amount: string;
  redpacketTitle: string;
  transferNote: string;
  timestamp: number;
}

interface UseMessageEditModalReturn {
  form: MessageFormData;
  initForm: (type: MessageType, senderId: string, existing?: ChatMessage) => void;
  chooseImage: () => void;
  toMessage: (id?: string) => ChatMessage;
}

function useMessageEditModal(): UseMessageEditModalReturn {
  const form = reactive<MessageFormData>({
    type: 'text',
    senderId: 'other',
    text: '',
    imageUrl: '',
    imageWidth: 0,
    imageHeight: 0,
    voiceDuration: 3,
    amount: '',
    redpacketTitle: '恭喜发财，大吉大利',
    transferNote: '',
    timestamp: Date.now(),
  });

  function initForm(type: MessageType, senderId: string, existing?: ChatMessage): void {
    if (existing) {
      Object.assign(form, {
        type: existing.type,
        senderId: existing.senderId,
        text: existing.text,
        imageUrl: existing.imageUrl,
        imageWidth: existing.imageWidth,
        imageHeight: existing.imageHeight,
        voiceDuration: existing.voiceDuration,
        amount: existing.amount,
        redpacketTitle: existing.redpacketTitle,
        transferNote: existing.transferNote,
        timestamp: existing.timestamp,
      });
    } else {
      Object.assign(form, {
        type,
        senderId,
        text: '',
        imageUrl: '',
        imageWidth: 0,
        imageHeight: 0,
        voiceDuration: 3,
        amount: '',
        redpacketTitle: '恭喜发财，大吉大利',
        transferNote: '',
        timestamp: Date.now(),
      });
    }
  }

  function chooseImage(): void {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: (res) => {
        form.imageUrl = res.tempFilePaths[0];
        uni.getImageInfo({
          src: res.tempFilePaths[0],
          success: (info) => {
            form.imageWidth = info.width;
            form.imageHeight = info.height;
          },
        });
      },
    });
  }

  function toMessage(id?: string): ChatMessage {
    const isSys = form.type === 'time' || form.type === 'recall' || form.type === 'system';
    return {
      id: id ?? genId(),
      role: isSys ? 'system' : form.senderId === 'self' ? 'self' : 'other',
      senderId: isSys ? 'system' : form.senderId,
      type: form.type,
      text: form.text,
      imageUrl: form.imageUrl,
      imageWidth: form.imageWidth,
      imageHeight: form.imageHeight,
      voiceDuration: form.voiceDuration,
      amount: form.amount,
      redpacketTitle: form.redpacketTitle,
      transferNote: form.transferNote,
      redpacketState: 'unopened',
      timestamp: form.timestamp,
    };
  }

  return { form, initForm, chooseImage, toMessage };
}

export { useMessageEditModal };
export type { MessageFormData, UseMessageEditModalReturn };
