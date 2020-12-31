<template>
  <div class="container">
    <pagetop label="企业微信绑定">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>CRM</el-breadcrumb-item>
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/setting/base/bind">
          系统设置
        </el-breadcrumb-item>
        <el-breadcrumb-item to="/setting/auth/account">
          权限管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="isactive">系统账号管理</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </pagetop>

    <!-- 筛选模块 -->
    <div class="dashboard-card dashboard-card--fullheight">
      <el-form
        ref="editForm"
        :rules="editFormRules"
        :model="editForm"
        size="small"
        label-width="100px"
      >
        <el-form-item prop="title" label="文章标题：">
          <el-input v-model="editForm.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item prop="cover" label="封面图：">
          <el-image class="article-cover" :src="editForm.cover" fit="cover">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          <el-upload
            :action="uploadUrl"
            name="image"
            :on-success="coverSuccess"
            :show-file-list="false"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传jpg/png文件，且不超过500kb
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item prop="keywords" label="关键字：">
          <el-input v-model="editForm.keywords" placeholder="请输入关键字" />
          <div class="tips">多关键词之间用英文逗号隔开</div>
        </el-form-item>
        <el-form-item prop="abstract" label="文章摘要：">
          <el-input
            v-model="editForm.abstract"
            placeholder="请输入摘要"
            type="textarea"
            :rows="6"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item prop="content" label="文章内容：" class="editor">
          <div id="content"></div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="onEdit = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submit">
          确 定
        </el-button>
      </span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Message } from 'element-ui'
import E from 'wangeditor'

export default {
  data() {
    return {
      uploadUrl: process.env.uploadUrl,
      // 编辑数据
      editForm: {
        title: '',
        cover: null,
        keywords: '',
        abstract: '',
        content: '',
      },
      editFormRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        cover: [{ required: true, message: '请上传封面图片', trigger: 'blur' }],
        roles: [{ required: true, message: '请选择角色', trigger: 'blur' }],
        status: [
          { required: true, message: '请选择账户状态', trigger: 'blur' },
        ],
      },
    }
  },
  computed: {
    // 将store.state中的属性映射到computed
    ...mapState(['userInfo']),
  },
  created() {
    this.edit()
  },
  mounted() {
    const editor = new E('#content')
    editor.config.uploadImgServer = process.env.uploadUrl
    editor.config.uploadImgMaxLength = 1
    editor.config.uploadImgMaxSize = 1 * 1024 * 1024 // 2M
    editor.config.uploadImgAccept = ['jpg', 'png']
    editor.config.customUploadImg = function (resultFiles, insertImgFn) {
      // resultFiles 是 input 中选中的文件列表
      // insertImgFn 是获取图片 url 后，插入到编辑器的方法
      const file = resultFiles[0]

      // const token = getCookie('token')
      const xhr = new XMLHttpRequest()
      xhr.open('POST', process.env.uploadUrl, true)
      // xhr.setRequestHeader('Authorization', token)

      // const loader = this.loader

      xhr.addEventListener('error', () => {
        Message.warning(`无法上传文件: ${file.name}.`)
      })
      // xhr.addEventListener('abort', () => reject())
      xhr.addEventListener('load', () => {
        const response = xhr.response
        const res = JSON.parse(response)

        // 上传成功，从后台获取图片的url地址
        if (res.code !== 1) {
          Message.warning(res.msg)
          return
        }

        insertImgFn(res.data)
      })

      // 支持时上传进度。文件加载器有#uploadTotal和#upload属性，用于在编辑器用户界面中显示上载进度栏。
      // if (xhr.upload) {
      //   xhr.upload.addEventListener('progress', (evt) => {
      //     if (evt.lengthComputable) {
      //       loader.uploadTotal = evt.total
      //       loader.uploaded = evt.loaded
      //     }
      //   })
      // }

      // 生成上传表单
      const data = new FormData()
      data.append('image', file)
      xhr.send(data)
    }
    editor.create()
  },
  methods: {
    /**
     * 编辑指定列表数据
     * @param {Number} id 数据ID
     */
    edit(id = null) {
      if (id) {
        this.$http.api({
          url: '/auth/accountInfo',
          params: { id },
          loading: true,
          success: (res) => {
            this.editForm = {
              id,
              account: res.data.account,
              password: '',
              name: res.data.name,
              mobile: res.data.mobile,
              roles: res.data.roles,
              status: res.data.status,
              remarks: res.data.remarks,
            }
          },
        })
      } else {
        this.editForm = {
          title: '',
          cover: null,
          keywords: '',
          abstract: '',
          content: '',
        }
      }
    },
    coverSuccess(res) {
      if (res.code !== 1) {
        Message.warning(res.msg)
        return
      }
      this.editForm.cover = res.data
    },
    /**
     * 提交新增/编辑表单
     */
    submit() {
      this.$refs.editForm.validate((valid, list) => {
        if (valid) {
          const params = {
            account: this.editForm.account,
            name: this.editForm.name,
            mobile: this.editForm.mobile,
            roles: this.editForm.roles,
            status: this.editForm.status,
            remarks: this.editForm.remarks,
          }

          if (this.editForm.id) {
            params.id = this.editForm.id
          } else {
            params.password = this.editForm.password
          }

          this.$http.api({
            url: '/auth/accountEdit',
            params,
            loading: true,
            method: 'post',
            success: (res) => {
              this.$message.success(`${params.id ? '修改' : '新增'}成功`)
              this.getData()
              this.onEdit = false
            },
          })
        }
      })
    },
  },
}
</script>

<style scoped>
.container {
}

.dashboard-card {
  padding: 30px 20px;
}

.article-cover {
  width: 300px;
  height: 160px;
}

.article-cover >>> .image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
  font-size: 30px;
}

.editor >>> .ck-content {
  min-height: 200px;
}
</style>
