import { shallowMount, mount } from '@vue/test-utils';
import Wall from '@/components/Wall.vue';
import Players from '@/components/Players.vue';
import App from '@/App.vue';

describe('App.vue', () => {
  it('Checking App component rendered or not', () => {
    const wrapper = shallowMount(App);
    
    expect(wrapper.find('header').length);
    expect(wrapper.vm.rows.length);
  });
});

describe('Wall.vue', () => {
  it('Checking wall component rendered or not', () => {
    const walls = [{
      key: 1,
      walls: [1,2,3],
      height: 4,
      isPony: true,
      isDomokun: false,
      isExit: false,
      isExitPath: true
    }];
    const wrapper = shallowMount(Wall, {
      propsData: { walls }
    });
    
    expect(wrapper.find('.walls').exists());
  });
});

describe('Players.vue', () => {
  it('Checking players component rendered or not', () => {
    const players = {
      key: 1,
      walls: [1,2,3],
      height: 4,
      isPony: true,
      isDomokun: false,
      isExit: false,
      isExitPath: true,
    };
    const wrapper = shallowMount(Players, {
      propsData: { ...players }
    });

    expect(wrapper.find('.pony-image').exists());

    expect(wrapper.vm.getElementClass).toBe('element 1 2 3 pony exitPath');
    expect(wrapper.vm.getElementStyle).toEqual({"height": "NaNpx", "width": "NaNpx"});
  });
});
