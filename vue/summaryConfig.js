export class addToConfig {
  constructor (obj) {
    for (const key in config) {
      if (obj.name !== config[key].name) {
        config = { ...config, [obj.name]: obj }
      }
    }
    console.log(config)
  }
}

let config = {
  syslogs: {
    id: 'filter_id_syslogs',
    name: 'Recent system events',
    isVisible: true
  },
  netlogs: {
    id: 'filter_id_netlogs',
    name: 'Recent network events',
    isVisible: true
  },
  lan: {
    id: 'filter_id_lan',
    name: 'lan',
    isVisible: true
  },
  wan: {
    id: 'filter_id_wan',
    name: 'wan',
    isVisible: true
  },
  wan6: {
    id: 'filter_id_wan6',
    name: 'wan6',
    isVisible: true
  }
}

export default config
