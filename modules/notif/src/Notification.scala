package lila.notif

import lila.forum.{Topic, Post}

sealed trait Notification

case class Mentioned(mentionedBy: String, post: Post, topic: Topic) extends Notification