<template>
  <div class="container">
    <page-top>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/auth/account">权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="isactive">操作日志</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </page-top>

    <!-- 筛选模块 -->
    <div class="dashboard-card">
      <div class="filterform">
        <div class="filterform__top">
          <el-input
            v-model="filterForm.search"
            class="filterform__search"
            size="small"
            placeholder="输入操作事件搜索"
            @keypress.enter.native="getData()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getData()" />
          </el-input>
        </div>
        <div class="filterform__group">
          <el-form
            inline
            :model="filterForm"
            size="small"
            @submit.native.prevent
          >
            <el-form-item>
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
                @change="getData()"
              />
            </el-form-item>
            <el-form-item>
              <el-select
                v-model="filterForm.moduleId"
                filterable
                clearable
                placeholder="全部模块"
                @change="getData()"
              >
                <el-option
                  v-for="module in operationModules"
                  :key="module.id"
                  :label="module.name"
                  :value="module.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="filterform__resetbtn" @click="clearFilterForm">
                <i class="el-icon-refresh-right" /> 重置
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 数据展示模块 -->
    <div v-loading="onLoading" class="dashboard-card">
      <el-table class="tableblock__table" stripe :data="tableData">
        <el-table-column
          prop="name"
          label="操作人"
          min-width="80"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.name || scope.row.account }}
          </template>
        </el-table-column>
        <el-table-column
          prop="module_name"
          label="操作模块"
          min-width="80"
          align="center"
        />
        <el-table-column
          prop="content"
          label="操作事件"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="ip"
          label="IP地址"
          min-width="120"
          align="center"
        />
        <el-table-column
          prop="create_time"
          label="操作时间"
          min-width="150"
          align="center"
        />
      </el-table>
      <el-pagination
        class="tableblock__pagination"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size.sync="prePage"
        :current-page="currentPage"
        @current-change="getData"
        @size-change="getData()"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      onLoading: false,
      operationModules: [],
      filterForm: {
        search: '',
        dateRange: null,
        moduleId: null,
      },
      tableData: [],
      total: 0,
      prePage: 20,
      currentPage: 0,
    }
  },
  created() {
    this.getData()

    this.getOperationModules()
  },
  methods: {
    /**
     * 获取标签数据
     */
    getOperationModules() {
      this.$http.api({
        url: '/common/operationModule',
        success: (res) => {
          this.operationModules = res.data
        },
      })
    },
    /**
     * 重置筛选表单
     */
    clearFilterForm() {
      this.filterForm = {
        search: '',
        dateRange: null,
        moduleId: null,
      }
      this.getData()
    },
    /**
     * 获取列表数据
     * @param {Number} page 页码
     */
    getData(page = 1) {
      const params = {
        page,
        num: this.prePage,
      }

      if (this.filterForm.search) {
        params.search = this.filterForm.search
      }

      if (this.filterForm.dateRange) {
        params.dateRange = this.filterForm.dateRange
      }

      if (this.filterForm.moduleId) {
        params.moduleId = this.filterForm.moduleId
      }

      this.onLoading = true
      this.$http.api({
        url: '/auth/operationLog',
        params,
        success: (res) => {
          this.tableData = res.data.data
          this.currentPage = res.data.current_page
          this.prePage = res.data.per_page
          this.total = res.data.total
        },
        complete: (res) => {
          this.onLoading = false
        },
      })
    },
  },
}
</script>

<style scoped>
.container {
}
</style>
