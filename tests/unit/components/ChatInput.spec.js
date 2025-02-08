// tests/unit/components/ChatInput.spec.js
import { mount } from '@vue/test-utils';
import ChatView from '@/views/chat.vue';
import { vi } from 'vitest';

describe('ChatView', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ChatView, {
      global: {
        stubs: ['router-link']
      }
    });
  });

  it('renders the chat interface correctly', () => {
    expect(wrapper.find('.chat-container').exists()).toBe(true);
    expect(wrapper.find('.chat-textarea').exists()).toBe(true);
    expect(wrapper.find('.send-button').exists()).toBe(true);
  });

  it('handles text input correctly', async () => {
    const input = wrapper.find('.chat-textarea');
    await input.setValue('Test message');
    expect(wrapper.vm.userInput).toBe('Test message');
  });

  it('sends messages correctly', async () => {
    const message = 'Test message';
    await wrapper.setData({ userInput: message });
    await wrapper.find('.send-button').trigger('click');
    
    const messages = wrapper.vm.messages;
    expect(messages[messages.length - 1].content).toBe(message);
    expect(messages[messages.length - 1].isUser).toBe(true);
  });

  it('handles file uploads correctly', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = wrapper.find('input[type="file"]');
    
    await input.trigger('change', {
      target: { files: [file] }
    });
    
    expect(wrapper.vm.uploadedFile).toBeTruthy();
    expect(wrapper.vm.uploadedFile.name).toBe('test.jpg');
  });

  it('displays error messages appropriately', async () => {
    await wrapper.setData({ error: 'Test error' });
    expect(wrapper.find('.alert-danger').text()).toBe('Test error');
  });
});
