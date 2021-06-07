<template>
  <div class="filterform">
    <div class="filterform__top">
      <div v-if="search" class="filterform__search">
        <slot name="search">
          <el-input
            v-model="filterForm.search"
            class="filterform__search-input"
            size="small"
            :placeholder="searchPlaceholder"
            @keypress.enter.native="$emit('search')"
          >
            <el-select
              v-if="searchOption"
              slot="prepend"
              v-model="filterForm.searchType"
              :style="{ width: `${searchOptionWidth}px` }"
            >
              <el-option
                v-for="(option, i) in searchOption"
                :key="i"
                :label="option"
                :value="i + 1"
              />
            </el-select>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="$emit('search')"
            />
          </el-input>
        </slot>
      </div>

      <div
        v-if="!$slots.default && search"
        class="filterform__resetbtn"
        @click="clearFilterForm"
      >
        <i class="el-icon-refresh-right" /> 重置
      </div>
      <div v-if="actionButton" class="filterform__topright">
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="$emit('actionClick')"
        >
          {{ actionButton }}
        </el-button>
      </div>
    </div>
    <div v-if="$slots.default" class="filterform__group">
      <el-form inline :model="filterForm" size="small" @submit.native.prevent>
        <slot></slot>
        <el-form-item>
          <div class="filterform__resetbtn" @click="clearFilterForm">
            <i class="el-icon-refresh-right" /> 重置
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyFilter',
  model: {
    prop: 'form',
    event: 'change',
  },
  props: {
    // 表单
    form: {
      type: Object,
      default: () => {
        return {
          searchType: 1,
          search: '',
        }
      },
    },
    // 默认表单，主要用于重置表单
    defaultForm: {
      type: Object,
      default: () => {
        return {
          searchType: 1,
          search: '',
        }
      },
    },
    // 是否使用左上角搜索框（slot），默认显示
    search: {
      type: Boolean,
      default: true,
    },
    // 搜索选项
    searchOption: {
      type: Array,
      default: null,
    },
    // 搜索选项的宽度
    searchOptionWidth: {
      type: Number,
      default: 100,
    },
    // 搜索的placeholder
    searchPlaceholder: {
      type: String,
      default: '输入关键字搜索',
    },
    // 右侧操作按钮，默认为null 不显示
    actionButton: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      editor: null,
      filterForm: '',
    }
  },
  computed: {},
  watch: {
    /**
     * filterForm更新时通知父组件更新v-model绑定的值
     * @param {String} val onChoice的新值
     */
    filterForm(val) {
      this.$emit('change', val)
    },
    /**
     * form（v-model绑定的值）更新时更新filterForm的值
     * @param {String} val onChoice的新值
     */
    form(val) {
      this.filterForm = val
    },
  },
  created() {
    this.filterForm = this.form
  },
  methods: {
    /**
     * 重置筛选表单
     */
    clearFilterForm() {
      this.filterForm = JSON.parse(JSON.stringify(this.defaultForm))

      this.$nextTick(() => {
        this.$emit('search')
        this.$emit('clear')
      })
    },
  },
}
</script>

<style scoped>
.filterform {
  padding: 20px 30px;
}

.filterform__top {
  display: flex;
}

.filterform__topright {
  flex: 1;
  text-align: right;
}

.filterform__search-input {
  width: 360px !important;
}

.filterform__search-input >>> .el-input-group__prepend {
  background-color: rgba(255, 255, 255, 1);
}

.filterform__search-input >>> .el-input-group__append {
  background-color: rgba(245, 247, 250, 1);
  color: rgba(220, 223, 230, 1);
}

.filterform__search + .filterform__group,
.filterform__top + .filterform__group,
.filterform__group + .filterform__group {
  margin-top: 19px;
}

.filterform__group {
  margin-bottom: -18px;
}

.filterform__search + .filterform__resetbtn {
  margin-left: 10px;
}

.filterform__resetbtn {
  height: 32px;
  color: rgba(102, 102, 102, 1);
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.filterform__resetbtn i {
  font-size: 20px;
  margin-right: 3px;
}

.filterform__resetbtn:hover {
  color: rgba(12, 12, 12, 1);
}

.filterform__resetbtn:active {
  color: rgba(112, 112, 112, 1);
}

.filterform__group + .filterform__actions,
.filterform__top + .filterform__actions {
  border-top: 1px solid rgba(238, 238, 238, 1);
  padding-top: 16px;
  margin-top: 18px;
}

.filterform__actions {
  display: flex;
  align-items: flex-start;
}

.filterform__actionslabel {
  padding-left: 2px;
  font-size: 14px;
  color: rgba(102, 102, 102, 1);
  line-height: 32px;
  margin-right: 20px;
}

.filterform__actionsright {
  flex: 1;
  text-align: right;
}
</style>
